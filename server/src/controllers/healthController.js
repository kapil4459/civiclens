export const healthController = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CivicLens API is running',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
};
