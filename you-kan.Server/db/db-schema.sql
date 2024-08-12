SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema you-kan
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `you-kan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `you-kan` ;

-- -----------------------------------------------------
-- Table `Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Projects`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Projects` (
  `project_id` INT NOT NULL AUTO_INCREMENT,
  `project_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `creator_user_id` INT NOT NULL,
  PRIMARY KEY (`project_id`, `creator_user_id`),
  INDEX `user_id_idx` (`creator_user_id` ASC) VISIBLE,
  CONSTRAINT `Projects_ibfk_1`
    FOREIGN KEY (`creator_user_id`)
    REFERENCES `Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Sprints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Sprints` (
  `sprint_id` INT NOT NULL AUTO_INCREMENT,
  `sprint_name` VARCHAR(255) NOT NULL,
  `project_id` INT NOT NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sprint_id`, `project_id`),
  INDEX `board_id` (`project_id` ASC) VISIBLE,
  CONSTRAINT `Sprints_ibfk_1`
    FOREIGN KEY (`project_id`)
    REFERENCES `Projects` (`project_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Tasks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Tasks` (
  `task_id` INT NOT NULL AUTO_INCREMENT,
  `task_title` VARCHAR(255) NOT NULL,
  `task_description` VARCHAR(255) NULL DEFAULT NULL,
  `sprint_id` INT NULL DEFAULT NULL,
  `priority` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(255) NOT NULL,
  `creator_user_id` INT NOT NULL,
  `assignee_user_id` INT NULL DEFAULT NULL,
  `task_type` VARCHAR(255) NOT NULL,
  `effort` INT NOT NULL,
  `project_id` INT NOT NULL,
  PRIMARY KEY (`task_id`, `project_id`),
  INDEX `creator_user_id` (`creator_user_id` ASC) VISIBLE,
  INDEX `Tasks_ibfk_3_idx` (`project_id` ASC) VISIBLE,
  INDEX `Tasks_ibfk_2_idx` (`sprint_id` ASC) VISIBLE,
  CONSTRAINT `Tasks_ibfk_1`
    FOREIGN KEY (`creator_user_id`)
    REFERENCES `you-kan`.`Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `Tasks_ibfk_4`
    FOREIGN KEY (`assignee_user_id`)
    REFERENCES `you-kan`.`Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `Tasks_ibfk_2`
    FOREIGN KEY (`sprint_id`)
    REFERENCES `you-kan`.`Sprints` (`sprint_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `Tasks_ibfk_3`
    FOREIGN KEY (`project_id`)
    REFERENCES `you-kan`.`Projects` (`project_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Subtasks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Subtasks` (
  `subtask_id` INT NOT NULL AUTO_INCREMENT,
  `subtask_description` VARCHAR(255) NOT NULL,
  `task_id` INT NOT NULL,
  PRIMARY KEY (`subtask_id`),
  INDEX `Subtasks_ibfk_1_idx` (`task_id` ASC) VISIBLE,
  CONSTRAINT `Subtasks_ibfk_1`
    FOREIGN KEY (`task_id`)
    REFERENCES `Tasks` (`task_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Comments` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `task_id` INT NOT NULL,
  `comment_text` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`comment_id`),
  INDEX `task_id_idx` (`task_id` ASC),
  INDEX `user_id_idx` (`user_id` ASC),
  CONSTRAINT `Comments_ibfk_1`
    FOREIGN KEY (`task_id`)
    REFERENCES `Tasks` (`task_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `Comments_ibfk_2`
    FOREIGN KEY (`user_id`)
    REFERENCES `Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Project_Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Project_Users` (
  `user_id` INT NOT NULL,
  `project_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `project_id`),
  INDEX `fk_Users_has_Projects_Projects1_idx` (`project_id` ASC) VISIBLE,
  INDEX `fk_Users_has_Projects_Users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_Users_has_Projects_Users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_has_Projects_Projects1`
    FOREIGN KEY (`project_id`)
    REFERENCES `Projects` (`project_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `Task_Assignees`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Task_Assignees` (
  `user_id` INT NOT NULL,
  `task_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `task_id`),
  INDEX `fk_Users_has_Tasks_Tasks1_idx` (`task_id` ASC) VISIBLE,
  INDEX `fk_Users_has_Tasks_Users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_Users_has_Tasks_Users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_has_Tasks_Tasks1`
    FOREIGN KEY (`task_id`)
    REFERENCES `Tasks` (`task_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;