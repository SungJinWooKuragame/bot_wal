-- Tabela de perguntas customizáveis por licença
CREATE TABLE IF NOT EXISTS license_questions (
  id VARCHAR(36) PRIMARY KEY,
  license_id VARCHAR(36) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('text', 'textarea', 'select', 'number', 'email') DEFAULT 'text',
  options JSON,
  required BOOLEAN DEFAULT TRUE,
  `order` INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
  INDEX idx_license_id (license_id),
  INDEX idx_order (`order`)
);

-- Tabela de audit logs para rastreamento de ações
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  license_id VARCHAR(36),
  action VARCHAR(255) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_license_id (license_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Tabela expandida para respostas de whitelist (se não existir)
ALTER TABLE whitelist_entries 
ADD COLUMN IF NOT EXISTS answers JSON,
ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
