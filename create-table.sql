CREATE TABLE historys(
  id INT NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  disease VARCHAR(255) NOT NULL,
  confidence FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE treatments (
  id INT NOT NULL AUTO_INCREMENT,
  treatment_id INT NOT NULL,
  disease VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE  (
  id INT NOT NULL AUTO_INCREMENT,
  treatment_id INT NOT NULL,
  history_id INT NOT NULL,

CREATE TABLE blog (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

    
