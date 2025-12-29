-- Tabela de usuários (compradores de licenças)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  discord_id VARCHAR(32) UNIQUE NOT NULL,
  discord_username VARCHAR(255) NOT NULL,
  discord_avatar VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de licenças
CREATE TABLE IF NOT EXISTS licenses (
  id VARCHAR(36) PRIMARY KEY,
  license_key VARCHAR(64) UNIQUE NOT NULL,
  user_id VARCHAR(36),
  status ENUM('active', 'suspended', 'expired', 'revoked') DEFAULT 'active',
  plan_type ENUM('lifetime', 'monthly', 'yearly') DEFAULT 'lifetime',
  vps_ip VARCHAR(45),
  vps_hostname VARCHAR(255),
  last_heartbeat TIMESTAMP NULL,
  bot_version VARCHAR(20),
  expires_at TIMESTAMP NULL,
  activated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_license_key (license_key),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Tabela de configurações do bot por licença
CREATE TABLE IF NOT EXISTS bot_configs (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) UNIQUE NOT NULL,
  guild_id VARCHAR(32),
  whitelist_role_id VARCHAR(32),
  log_channel_id VARCHAR(32),
  accept_channel_id VARCHAR(32),
  reprove_channel_id VARCHAR(32),
  embed_color VARCHAR(7) DEFAULT '#0099ff',
  welcome_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- Tabela de logs de validação/heartbeat
CREATE TABLE IF NOT EXISTS validation_logs (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
  INDEX idx_license_id (license_id),
  INDEX idx_created_at (created_at)
);

-- Tabela de whitelists (para o sistema de WL do FiveM)
CREATE TABLE IF NOT EXISTS whitelist_entries (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NOT NULL,
  discord_user_id VARCHAR(32) NOT NULL,
  discord_username VARCHAR(255),
  status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
  INDEX idx_license_id (license_id),
  INDEX idx_discord_user_id (discord_user_id),
  INDEX idx_status (status)
);
