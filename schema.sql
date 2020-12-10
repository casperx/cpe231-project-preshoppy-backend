CREATE TABLE `event` (
  `e_id` int(11) NOT NULL AUTO_INCREMENT,
  `e_name` varchar(255) NOT NULL,
  `e_detail` varchar(5000) NOT NULL,
  `e_start_datetime` datetime NOT NULL,
  `e_end_datetime` datetime NOT NULL,
  `e_location` varchar(500) NOT NULL,
  `e_contact` varchar(500) NOT NULL,
  `e_event_pic` varchar(100) NOT NULL,
  PRIMARY KEY (`e_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_role` (
  `ur_id` int(11) NOT NULL AUTO_INCREMENT,
  `ur_detail` varchar(100) NOT NULL,
  PRIMARY KEY (`ur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_vendor_status` (
  `uvs_id` int(11) NOT NULL AUTO_INCREMENT,
  `uvs_name` varchar(100) NOT NULL,
  `uvs_detail` varchar(255) NOT NULL,
  PRIMARY KEY (`uvs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_email` varchar(64) NOT NULL,
  `u_password` varchar(255) DEFAULT NULL,
  `u_first_name` varchar(100) DEFAULT NULL,
  `u_last_name` varchar(100) DEFAULT NULL,
  `u_tel` varchar(100) DEFAULT NULL,
  `u_profile_pic` varchar(100) DEFAULT NULL,
  `u_id_card_pic` varchar(100) DEFAULT NULL,
  `u_verify_pic` varchar(100) DEFAULT NULL,
  `ur_id` int(11) NOT NULL DEFAULT 3,
  `uvs_id` int(11) NOT NULL DEFAULT 1,
  `ua_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`u_id`),
  KEY `ur_id` (`ur_id`),
  KEY `uvs_id` (`uvs_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`ur_id`) REFERENCES `user_role` (`ur_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`uvs_id`) REFERENCES `user_vendor_status` (`uvs_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_address` (
  `ua_id` int(11) NOT NULL AUTO_INCREMENT,
  `ua_name` varchar(100) NOT NULL,
  `ua_address` varchar(500) NOT NULL,
  `ua_tel` varchar(100) DEFAULT NULL,
  `u_id` int(11) NOT NULL,
  PRIMARY KEY (`ua_id`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `user_address_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `user` (`u_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `match` (
  `m_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_buyer_id` int(11) NOT NULL,
  `u_seller_id` int(11) NOT NULL,
  `e_id` int(11) NOT NULL,
  PRIMARY KEY (`m_id`),
  KEY `u_buyer_id` (`u_buyer_id`),
  KEY `u_seller_id` (`u_seller_id`),
  KEY `e_id` (`e_id`),
  CONSTRAINT `match_ibfk_1` FOREIGN KEY (`u_buyer_id`) REFERENCES `user` (`u_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `match_ibfk_2` FOREIGN KEY (`u_seller_id`) REFERENCES `user` (`u_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `match_ibfk_3` FOREIGN KEY (`e_id`) REFERENCES `event` (`e_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\

CREATE TABLE `match_queue` (
  `mq_id` int(11) NOT NULL AUTO_INCREMENT,
  `mq_type` int(11) NOT NULL,
  `u_id` int(11) DEFAULT NULL,
  `e_id` int(11) NOT NULL,
  PRIMARY KEY (`mq_id`),
  KEY `u_id` (`u_id`),
  KEY `e_id` (`e_id`),
  CONSTRAINT `match_queue_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `user` (`u_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `match_queue_ibfk_2` FOREIGN KEY (`e_id`) REFERENCES `event` (`e_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `transaction` (
  `t_id` int(11) NOT NULL AUTO_INCREMENT,
  `t_timestamp` datetime NOT NULL,
  `t_status` int(11) NOT NULL DEFAULT 1,
  `t_evidence_pic` varchar(100) DEFAULT NULL,
  `t_address` varchar(500) NOT NULL,
  `t_tracking` varchar(255) DEFAULT NULL,
  `u_buyer_id` int(11) NOT NULL,
  `u_seller_id` int(11) NOT NULL,
  `e_id` int(11) NOT NULL,
  PRIMARY KEY (`t_id`),
  KEY `u_buyer_id` (`u_buyer_id`),
  KEY `u_seller_id` (`u_seller_id`),
  KEY `e_id` (`e_id`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`u_buyer_id`) REFERENCES `user` (`u_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`u_seller_id`) REFERENCES `user` (`u_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`e_id`) REFERENCES `event` (`e_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\

CREATE TABLE `transaction_item` (
  `ti_id` int(11) NOT NULL AUTO_INCREMENT,
  `ti_name` varchar(255) NOT NULL,
  `ti_detail` varchar(500) NOT NULL,
  `ti_price` float NOT NULL,
  `ti_quantity` int(11) NOT NULL,
  `t_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`ti_id`),
  KEY `t_id` (`t_id`),
  CONSTRAINT `transaction_item_ibfk_1` FOREIGN KEY (`t_id`) REFERENCES `transaction` (`t_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO user_role (ur_detail) VALUES
  ('Admin'),
  ('Supporter'),
  ('Buyer'),
  ('Seller');

INSERT INTO user_vendor_status (uvs_name,uvs_detail) VALUES
  ('not request','not request'),
  ('request pending','Your request is pending for our Supporter to inspect.'),
  ('request granted','Your request has been granted. You are seller now.'),
  ('request rejected','Your request has been rejected. Please review your information again.');
