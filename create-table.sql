-- Create the articles table
CREATE TABLE articles (
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Create the blog table
CREATE TABLE blog (
    id INT NOT NULL AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Create the detection table
CREATE TABLE detection (
    id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    confidence FLOAT NOT NULL,
    disease VARCHAR(100) NOT NULL,
    treatment_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Create the treatments table
CREATE TABLE treatments (
    id INT NOT NULL AUTO_INCREMENT,
    treatment_id INT DEFAULT NULL,
    disease VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
