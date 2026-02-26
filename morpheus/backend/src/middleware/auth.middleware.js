import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware: verify Bearer access token and attach req.user
 */
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.slice(7);

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token expired' });
        }
        return res.status(401).json({ message: 'Invalid access token' });
    }
}

/**
 * Middleware factory: restrict route to specific roles
 * @param {...string} roles
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }
        next();
    };
}
