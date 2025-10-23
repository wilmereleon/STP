-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Teleprompter v2.0
-- Motor: MySQL 8.0+
-- Normalización: 3FN
-- ============================================

-- Crear base de datos
DROP DATABASE IF EXISTS teleprompter;
CREATE DATABASE teleprompter 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE teleprompter;

-- ============================================
-- TABLA: users
-- Almacena usuarios del sistema
-- ============================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed',
  role ENUM('Producer', 'Operator', 'Admin') NOT NULL DEFAULT 'Operator',
  avatar VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  preferences JSON NULL COMMENT 'User preferences as JSON',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at DESC),
  
  CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios del sistema con autenticación';

-- ============================================
-- TABLA: scripts
-- Guiones para el teleprompter
-- ============================================
CREATE TABLE scripts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  category ENUM('Noticias', 'Deportes', 'Clima', 'Entrevista', 'Especial', 'Comercial', 'Otro') NOT NULL DEFAULT 'Noticias',
  status ENUM('Borrador', 'Revisión', 'Aprobado', 'En Uso', 'Archivado') NOT NULL DEFAULT 'Borrador',
  priority ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  duration INT NOT NULL DEFAULT 0 COMMENT 'Duración estimada en segundos',
  font_size INT NULL COMMENT 'Tamaño de fuente específico (12-120)',
  scroll_speed INT NULL COMMENT 'Velocidad de scroll específica (1-100)',
  producer_notes TEXT NULL COMMENT 'Notas del productor (max 1000 chars)',
  tags JSON NULL COMMENT 'Array de tags para búsqueda',
  times_used INT NOT NULL DEFAULT 0 COMMENT 'Contador de uso',
  last_used_at DATETIME NULL,
  created_by CHAR(36) NOT NULL,
  last_modified_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE SET NULL,
  
  FULLTEXT INDEX idx_fulltext_search (title, content),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_compound_status_date (status, created_at DESC),
  
  CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) <= 200),
  CONSTRAINT chk_duration_positive CHECK (duration >= 0),
  CONSTRAINT chk_font_size_range CHECK (font_size IS NULL OR (font_size >= 12 AND font_size <= 120)),
  CONSTRAINT chk_scroll_speed_range CHECK (scroll_speed IS NULL OR (scroll_speed >= 1 AND scroll_speed <= 100)),
  CONSTRAINT chk_producer_notes_length CHECK (producer_notes IS NULL OR CHAR_LENGTH(producer_notes) <= 1000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Guiones de teleprompter con versionado';

-- ============================================
-- TABLA: script_versions
-- Historial de versiones de scripts
-- ============================================
CREATE TABLE script_versions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  script_id CHAR(36) NOT NULL,
  version_number INT NOT NULL,
  content LONGTEXT NOT NULL,
  change_description VARCHAR(500) NULL,
  modified_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE KEY uk_script_version (script_id, version_number),
  INDEX idx_script_id (script_id),
  INDEX idx_version_number (version_number DESC),
  INDEX idx_created_at (created_at DESC),
  
  CONSTRAINT chk_version_number_positive CHECK (version_number > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de versiones de scripts (máximo 10 por script)';

-- ============================================
-- TABLA: run_orders
-- Orden de ejecución de scripts
-- ============================================
CREATE TABLE run_orders (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  total_duration INT NOT NULL DEFAULT 0 COMMENT 'Duración total calculada',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lista de reproducción de scripts';

-- Constraint: Solo 1 RunOrder activo por usuario
-- (Implementado a nivel de aplicación o trigger)

-- ============================================
-- TABLA: run_order_items
-- Items de un RunOrder
-- ============================================
CREATE TABLE run_order_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  run_order_id CHAR(36) NOT NULL,
  script_id CHAR(36) NOT NULL,
  position INT NOT NULL COMMENT 'Orden en la lista',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (run_order_id) REFERENCES run_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  
  INDEX idx_run_order_id (run_order_id),
  INDEX idx_script_id (script_id),
  INDEX idx_position (position),
  INDEX idx_is_completed (is_completed),
  
  CONSTRAINT chk_position_positive CHECK (position >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Items individuales de un RunOrder';

-- ============================================
-- TABLA: configurations
-- Configuraciones de usuario
-- ============================================
CREATE TABLE configurations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL UNIQUE,
  scroll_speed INT NOT NULL DEFAULT 50,
  font_size INT NOT NULL DEFAULT 32,
  background_color CHAR(7) NOT NULL DEFAULT '#000000',
  text_color CHAR(7) NOT NULL DEFAULT '#FFFFFF',
  guideline_position INT NOT NULL DEFAULT 50,
  guideline_color CHAR(7) NOT NULL DEFAULT '#FF0000',
  guideline_thickness INT NOT NULL DEFAULT 2,
  guideline_visible BOOLEAN NOT NULL DEFAULT TRUE,
  auto_advance BOOLEAN NOT NULL DEFAULT FALSE,
  theme ENUM('Light', 'Dark') NOT NULL DEFAULT 'Dark',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  
  CONSTRAINT chk_scroll_speed_range CHECK (scroll_speed >= 1 AND scroll_speed <= 100),
  CONSTRAINT chk_font_size_range CHECK (font_size >= 12 AND font_size <= 120),
  CONSTRAINT chk_guideline_position_range CHECK (guideline_position >= 0 AND guideline_position <= 100),
  CONSTRAINT chk_guideline_thickness_range CHECK (guideline_thickness >= 1 AND guideline_thickness <= 10),
  CONSTRAINT chk_hex_color_bg CHECK (background_color REGEXP '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT chk_hex_color_text CHECK (text_color REGEXP '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT chk_hex_color_guideline CHECK (guideline_color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Configuraciones personalizadas por usuario';

-- ============================================
-- TABLA: macros
-- Macros de teclado configurables
-- ============================================
CREATE TABLE macros (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  key_binding VARCHAR(20) NOT NULL COMMENT 'F1-F12, PageUp, PageDown, etc.',
  action VARCHAR(50) NOT NULL COMMENT 'play, pause, reset, nextScript, etc.',
  description VARCHAR(200) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  params JSON NULL COMMENT 'Parámetros adicionales',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY uk_user_key (user_id, key_binding),
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  
  CONSTRAINT chk_key_binding_not_empty CHECK (key_binding != ''),
  CONSTRAINT chk_action_not_empty CHECK (action != '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Macros de teclado personalizables';

-- ============================================
-- TABLA: jump_markers
-- Marcadores de salto en scripts largos
-- ============================================
CREATE TABLE jump_markers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  script_id CHAR(36) NOT NULL,
  position INT NOT NULL COMMENT 'Posición en el contenido (índice de carácter)',
  label VARCHAR(100) NOT NULL,
  color CHAR(7) NOT NULL DEFAULT '#FFFF00',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  
  INDEX idx_script_id (script_id),
  INDEX idx_position (position),
  
  CONSTRAINT chk_position_positive CHECK (position >= 0),
  CONSTRAINT chk_label_not_empty CHECK (label != ''),
  CONSTRAINT chk_hex_color_marker CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Marcadores para navegación rápida en scripts largos';

-- ============================================
-- TABLA: collaborations
-- Colaboración en tiempo real
-- ============================================
CREATE TABLE collaborations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  script_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  action ENUM('Viewing', 'Editing', 'Commenting') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  lock_expiry DATETIME NULL COMMENT 'Expiración del lock de edición',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_script_id (script_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_lock_expiry (lock_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Gestión de colaboración y locks de edición';

-- ============================================
-- TABLA: audit_logs
-- Auditoría de cambios
-- ============================================
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON NULL COMMENT 'Cambios realizados',
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_compound_entity (entity_type, entity_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Log de auditoría para trazabilidad';

-- ============================================
-- TABLA: sessions
-- Sesiones de usuario (JWT)
-- ============================================
CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token TEXT NOT NULL COMMENT 'JWT token',
  refresh_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sesiones activas de usuarios';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar total_duration en run_orders
DELIMITER $$
CREATE TRIGGER trg_update_runorder_duration_insert
AFTER INSERT ON run_order_items
FOR EACH ROW
BEGIN
  UPDATE run_orders ro
  SET total_duration = (
    SELECT SUM(s.duration)
    FROM run_order_items roi
    JOIN scripts s ON roi.script_id = s.id
    WHERE roi.run_order_id = NEW.run_order_id
  )
  WHERE ro.id = NEW.run_order_id;
END$$

CREATE TRIGGER trg_update_runorder_duration_delete
AFTER DELETE ON run_order_items
FOR EACH ROW
BEGIN
  UPDATE run_orders ro
  SET total_duration = COALESCE((
    SELECT SUM(s.duration)
    FROM run_order_items roi
    JOIN scripts s ON roi.script_id = s.id
    WHERE roi.run_order_id = OLD.run_order_id
  ), 0)
  WHERE ro.id = OLD.run_order_id;
END$$

-- Trigger: Limitar versiones a 10 por script
CREATE TRIGGER trg_limit_script_versions
BEFORE INSERT ON script_versions
FOR EACH ROW
BEGIN
  DECLARE version_count INT;
  
  SELECT COUNT(*) INTO version_count
  FROM script_versions
  WHERE script_id = NEW.script_id;
  
  IF version_count >= 10 THEN
    -- Eliminar la versión más antigua
    DELETE FROM script_versions
    WHERE script_id = NEW.script_id
    ORDER BY version_number ASC
    LIMIT 1;
  END IF;
END$$

-- Trigger: Incrementar times_used cuando se agrega a RunOrder
CREATE TRIGGER trg_increment_script_usage
AFTER INSERT ON run_order_items
FOR EACH ROW
BEGIN
  UPDATE scripts
  SET times_used = times_used + 1,
      last_used_at = NOW()
  WHERE id = NEW.script_id;
END$$

-- Trigger: Validar solo 1 RunOrder activo por usuario
CREATE TRIGGER trg_validate_active_runorder
BEFORE UPDATE ON run_orders
FOR EACH ROW
BEGIN
  DECLARE active_count INT;
  
  IF NEW.is_active = TRUE AND OLD.is_active = FALSE THEN
    SELECT COUNT(*) INTO active_count
    FROM run_orders
    WHERE user_id = NEW.user_id AND is_active = TRUE AND id != NEW.id;
    
    IF active_count > 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo puede haber un RunOrder activo por usuario';
    END IF;
  END IF;
END$$

DELIMITER ;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento: Buscar scripts con filtros
DELIMITER $$
CREATE PROCEDURE sp_search_scripts(
  IN p_search_text VARCHAR(255),
  IN p_category VARCHAR(50),
  IN p_status VARCHAR(50),
  IN p_priority VARCHAR(50),
  IN p_created_by CHAR(36),
  IN p_limit INT,
  IN p_offset INT
)
BEGIN
  SELECT 
    s.*,
    u1.name AS created_by_name,
    u2.name AS last_modified_by_name
  FROM scripts s
  LEFT JOIN users u1 ON s.created_by = u1.id
  LEFT JOIN users u2 ON s.last_modified_by = u2.id
  WHERE 
    (p_search_text IS NULL OR MATCH(s.title, s.content) AGAINST(p_search_text IN NATURAL LANGUAGE MODE))
    AND (p_category IS NULL OR s.category = p_category)
    AND (p_status IS NULL OR s.status = p_status)
    AND (p_priority IS NULL OR s.priority = p_priority)
    AND (p_created_by IS NULL OR s.created_by = p_created_by)
  ORDER BY s.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

-- Procedimiento: Obtener estadísticas de usuario
CREATE PROCEDURE sp_get_user_stats(IN p_user_id CHAR(36))
BEGIN
  SELECT 
    COUNT(*) AS total_scripts,
    SUM(CASE WHEN status = 'Aprobado' THEN 1 ELSE 0 END) AS approved_scripts,
    SUM(CASE WHEN status = 'Borrador' THEN 1 ELSE 0 END) AS draft_scripts,
    SUM(times_used) AS total_uses,
    AVG(duration) AS avg_duration
  FROM scripts
  WHERE created_by = p_user_id;
END$$

DELIMITER ;

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Usuario administrador por defecto
-- Password: admin123 (hash bcrypt)
INSERT INTO users (id, name, email, password, role, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@teleprompter.com', '$2b$10$YourBcryptHashedPasswordHere', 'Admin', TRUE);

-- Configuración por defecto para admin
INSERT INTO configurations (user_id) VALUES
('00000000-0000-0000-0000-000000000001');

-- Macros por defecto
INSERT INTO macros (user_id, key_binding, action, description) VALUES
('00000000-0000-0000-0000-000000000001', 'F11', 'togglePlay', 'Iniciar/Pausar scroll'),
('00000000-0000-0000-0000-000000000001', 'F10', 'reset', 'Reiniciar scroll al inicio'),
('00000000-0000-0000-0000-000000000001', 'PageDown', 'nextScript', 'Siguiente script en RunOrder'),
('00000000-0000-0000-0000-000000000001', 'PageUp', 'previousScript', 'Script anterior en RunOrder'),
('00000000-0000-0000-0000-000000000001', 'Ctrl+Plus', 'increaseFontSize', 'Aumentar tamaño de fuente'),
('00000000-0000-0000-0000-000000000001', 'Ctrl+Minus', 'decreaseFontSize', 'Disminuir tamaño de fuente');

-- ============================================
-- VISTAS
-- ============================================

-- Vista: Scripts con información de usuarios
CREATE VIEW v_scripts_detailed AS
SELECT 
  s.*,
  u1.name AS created_by_name,
  u1.email AS created_by_email,
  u2.name AS last_modified_by_name,
  u2.email AS last_modified_by_email
FROM scripts s
LEFT JOIN users u1 ON s.created_by = u1.id
LEFT JOIN users u2 ON s.last_modified_by = u2.id;

-- Vista: RunOrders con items
CREATE VIEW v_runorders_with_items AS
SELECT 
  ro.id AS runorder_id,
  ro.name AS runorder_name,
  ro.user_id,
  u.name AS user_name,
  ro.is_active,
  ro.total_duration,
  COUNT(roi.id) AS item_count,
  ro.created_at,
  ro.updated_at
FROM run_orders ro
JOIN users u ON ro.user_id = u.id
LEFT JOIN run_order_items roi ON ro.id = roi.run_order_id
GROUP BY ro.id, ro.name, ro.user_id, u.name, ro.is_active, ro.total_duration, ro.created_at, ro.updated_at;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
