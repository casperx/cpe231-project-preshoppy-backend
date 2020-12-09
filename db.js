const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        define: {
            timestamps: false
        }
    }
);

const Event = sequelize.define(
    'Event',
    {
        id: { field: 'e_id', type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { field: 'e_name', type: DataTypes.STRING },
        detail: { field: 'e_detail', type: DataTypes.STRING(5000) },
        startDateTime: { field: 'e_start_datetime', type: DataTypes.DATE },
        endDateTime: { field: 'e_end_datetime', type: DataTypes.DATE },
        location: { field: 'e_location', type: DataTypes.STRING(500) },
        contact: { field: 'e_contact', type: DataTypes.STRING },
        eventPic: { field: 'e_event_pic', type: DataTypes.STRING(100) }
    },
    {
        tableName: 'event'
    }
);

const User = sequelize.define(
    'User',
    {
        id: { field: 'u_id', type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        email: { field: 'u_email', type: DataTypes.STRING(64) },
        password: { field: 'u_password', type: DataTypes.STRING },
        firstName: { field: 'u_first_name', type: DataTypes.STRING(100) },
        lastName: { field: 'u_last_name', type: DataTypes.STRING(100) },
        tel: { field: 'u_tel', type: DataTypes.STRING(100) },
        profilePic: { field: 'u_profile_pic', type: DataTypes.STRING(100) },
        idCardPic: { field: 'u_id_card_pic', type: DataTypes.STRING(100), allowNull: true },
        verifyPic: { field: 'u_verify_pic', type: DataTypes.STRING(100), allowNull: true }
    },
    {
        tableName: 'user'
    }
);

const UserAddress = sequelize.define(
    'UserAddress',
    {
        id: { field: 'ua_id', type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { field: 'ua_name', type: DataTypes.STRING(100) },
        tel: { field: 'ua_tel', type: DataTypes.STRING(100) },
        address: { field: 'ua_address', type: DataTypes.STRING(500) }
    },
    {
        tableName: 'user_address'
    }
);

const UserRole = sequelize.define(
    'UserRole',
    {
        id: { field: 'ur_id', type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { field: 'ur_name', type: DataTypes.STRING(100) }
    },
    {
        tableName: 'user_role'
    }
);

const UserVendorStatus = sequelize.define(
    'UserVendorStatus',
    {
        id: { field: 'uvs_id', type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { field: 'uvs_name', type: DataTypes.STRING(100) },
        detail: { field: 'uvs_detail', type: DataTypes.STRING }
    },
    {
        tableName: 'user_vendor_status'
    }
);

User.belongsTo(
    UserAddress,
    {
        foreignKey: { name: 'address', field: 'ua_id' },
        foreignKeyConstraint: true
    }
);

UserAddress.belongsTo(
    User,
    {
        foreignKey: { name: 'user', field: 'u_id' },
        foreignKeyConstraint: true
    }
);

UserRole.belongsTo(
    User,
    {
        foreignKey: { name: 'role', field: 'ur_id' },
        foreignKeyConstraint: true
    }
);

UserVendorStatus.belongsTo(
    User,
    {
        foreignKey: { name: 'vendorStatus', field: 'uvs_id' },
        foreignKeyConstraint: true
    }
);

module.exports = {
    Event,
    User,
    UserRole,
    UserAddress,
    UserVendorStatus
};
