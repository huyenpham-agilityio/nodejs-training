import 'dotenv/config';
import app from './app';
import { sequelize } from './configs/db';
import './configs/associations'; // Initialize model associations
import { ENVS } from './constants/env';

(async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(ENVS.PORT, () => {
      console.log(`Server running on http://localhost:${ENVS.PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
})();
