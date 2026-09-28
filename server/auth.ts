import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getAllUsers, getUserByEmail, getUserByGoogleSub, createUser, updateUser } from './repositories/users.js';
import { requireAuth, AuthRequest } from './middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const setSessionCookie = (res: any, user: any) => {
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role, 
      status: user.status || (user.role === 'admin' ? 'active' : 'pending'),
      session_version: user.session_version 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

router.post('/google-login', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing credential' } });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (tokenErr: any) {
    console.error('Google token verification failed:', tokenErr.message);
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token Google không hợp lệ hoặc đã hết hạn' } });
  }

  if (!payload || !payload.email_verified) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Email chưa được xác thực bởi Google' } });
  }

  try {
    const { sub, email, name } = payload;

    // 1. Tìm bằng google_sub
    let user = await getUserByGoogleSub(sub);

    // 2. Nếu không thấy google_sub, tìm bằng email để chuẩn hóa/link
    if (!user) {
      user = await getUserByEmail(email!);
      
      if (user) {
        // Có email tương ứng -> Cập nhật (link) google_sub
        await updateUser(user.rowIndex, { 
          google_sub: sub, 
          google_email: email,
          last_login_at: new Date().toISOString()
        });
      } else {
        // Kiểm tra xem đã có user nào trong bảng USERS chưa
        const allUsers = await getAllUsers();
        // Tài khoản đầu tiên đăng ký hệ thống sẽ tự động là Admin Active
        const isFirstUser = allUsers.length === 0;
        const initialRole = isFirstUser ? 'admin' : 'user';
        const initialStatus = isFirstUser ? 'active' : 'pending';

        user = await createUser({
          email: email!,
          password_hash: '', // Không có mk
          name: name || 'Google User',
          role: initialRole,
          status: initialStatus,
          google_sub: sub,
          google_email: email!,
          auth_provider: 'google',
          last_login_at: new Date().toISOString(),
          session_version: '1',
          created_at: new Date().toISOString()
        }) as any;
      }
    } else {
      // Đã có user qua google_sub -> Cập nhật last login
      await updateUser(user.rowIndex, {
        last_login_at: new Date().toISOString()
      });
    }

    setSessionCookie(res, user);
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user?.id, 
        email: user?.email, 
        name: user?.name, 
        role: user?.role,
        status: user?.status || (user?.role === 'admin' ? 'active' : 'pending')
      } 
    });

  } catch (error: any) {
    console.error('Google login database error:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: `Lỗi kết nối cơ sở dữ liệu Google Sheets: ${error.message}` } });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    }

    await updateUser(user.rowIndex, { last_login_at: new Date().toISOString() });
    
    setSessionCookie(res, user);
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        status: user.status
      } 
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Lấy danh sách toàn bộ tài khoản (Chỉ Admin)
router.get('/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền xem danh sách người dùng' } });
    }
    const users = await getAllUsers();
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      last_login_at: u.last_login_at,
      created_at: u.created_at,
      auth_provider: u.auth_provider,
    }));
    res.json({ users: safeUsers });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Cập nhật phân quyền / duyệt / khóa tài khoản (Chỉ Admin)
router.post('/users/:id/update-role', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền cập nhật quyền' } });
    }
    const { id } = req.params;
    const { role, status } = req.body;
    const users = await getAllUsers();
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } });
    }

    await updateUser(targetUser.rowIndex, {
      role: role ?? targetUser.role,
      status: status ?? targetUser.status
    });

    res.json({ 
      message: 'Cập nhật phân quyền thành công', 
      user: { id, role: role ?? targetUser.role, status: status ?? targetUser.status } 
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
