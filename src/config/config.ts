export default () => {
  return {
    jwt: {
      secret: process.env.JWT_SECRET,
      accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1d',
      refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d',
    },
    smsProvider: {
      bulkSmsBd: {
        apiKey: process.env.BULKSMSBD_API_KEY,
        senderId: process.env.BULKSMSBD_SENDER_ID,
      },
    },
    otpValidityMin: parseInt(process.env.OTP_CODE_VALIDITY_MIN) || 3,
  };
};
