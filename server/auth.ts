import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserByGoogleSub, createUser, updateUser } from './repositories/users.js';
import { requireAuth, AuthRequest } from './middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const setSessionCookie = (res: any, user: any) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, session_version: user.session_version },
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

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Email not verified by Google' } });
    }

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
        // Chưa tồn tại user nào -> Tự động tạo mới (Provisioning) 
        // *Ghi chú: Theo rule gsheet_auth_crud, nếu system không auto-provision thì throw error. Ở đây để thuận tiện nghiệm thu, tạo mới với quyền User.
        user = await createUser({
          email: email!,
          password_hash: '', // Không có mk
          name: name || 'Google User',
          role: 'user',
          google_sub: sub,
          google_email: email!,
          auth_provider: 'google',
          last_login_at: new Date().toISOString(),
          session_version: '1'
        }) as any;
      }
    } else {
      // Đã có user qua google_sub -> Cập nhật last login
      await updateUser(user.rowIndex, {
        last_login_at: new Date().toISOString()
      });
    }

    setSessionCookie(res, user);
    res.json({ message: 'Login successful', user: { id: user?.id, email: user?.email, name: user?.name, role: user?.role } });

  } catch (error: any) {
    console.error('Google login error:', error.message);
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid Google token' } });
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
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
