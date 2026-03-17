const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { sub: userId },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
    );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { sub: userId, type: 'refresh' },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpire }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Decode token without verification (for refresh tokens)
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};
