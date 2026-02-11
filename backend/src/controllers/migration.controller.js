const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const runMigration = async (req, res) => {
  try {
    logger.info('Starting manual database migration...');
    await sequelize.sync({ alter: true });
    logger.info('✅ Database migration completed successfully');
    
    res.json({
      success: true,
      message: 'Database migration completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Migration failed', details: error.message }
    });
  }
};

const checkDatabase = async (req, res) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      tables: results.map(r => r.table_name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Database connection failed', details: error.message }
    });
  }
};

module.exports = { runMigration, checkDatabase };