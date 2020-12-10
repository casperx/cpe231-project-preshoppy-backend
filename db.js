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
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'e_id' },

        name: { type: DataTypes.STRING, allowNull: false, field: 'e_name' },
        detail: { type: DataTypes.STRING(5000), allowNull: false, field: 'e_detail' },

        startDateTime: { type: DataTypes.DATE, allowNull: false, field: 'e_start_datetime' },
        endDateTime: { type: DataTypes.DATE, allowNull: false, field: 'e_end_datetime' },

        location: { type: DataTypes.STRING(500), allowNull: false, field: 'e_location' },
        contact: { type: DataTypes.STRING(500), allowNull: false, field: 'e_contact' },

        eventPic: { type: DataTypes.STRING(100), allowNull: false, field: 'e_event_pic' }
    },
    {
        tableName: 'event'
    }
);

const UserRole = sequelize.define(
    'UserRole',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ur_id' },

        detail: { type: DataTypes.STRING(100), allowNull: false, field: 'ur_detail' }
    },
    {
        tableName: 'user_role'
    }
);

const UserVendorStatus = sequelize.define(
    'UserVendorStatus',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'uvs_id' },

        name: { type: DataTypes.STRING(100), allowNull: false, field: 'uvs_name' },
        detail: { type: DataTypes.STRING, allowNull: false, field: 'uvs_detail' }
    },
    {
        tableName: 'user_vendor_status'
    }
);

const UserAddress = sequelize.define(
    'UserAddress',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ua_id' },

        name: { type: DataTypes.STRING(100), allowNull: false, field: 'ua_name' },
        address: { type: DataTypes.STRING(500), allowNull: false, field: 'ua_address' },

        tel: { type: DataTypes.STRING(100), allowNull: false, field: 'ua_tel' }
    },
    {
        tableName: 'user_address'
    }
);

const User = sequelize.define(
    'User',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'u_id' },

        email: { type: DataTypes.STRING(64), allowNull: false, field: 'u_email' },
        password: { type: DataTypes.STRING, allowNull: false, field: 'u_password' },

        firstName: { type: DataTypes.STRING(100), allowNull: false, field: 'u_first_name' },
        lastName: { type: DataTypes.STRING(100), allowNull: false, field: 'u_last_name' },

        tel: { type: DataTypes.STRING(100), allowNull: false, field: 'u_tel' },

        profilePic: { type: DataTypes.STRING(100), allowNull: false, field: 'u_profile_pic' },

        idCardPic: { type: DataTypes.STRING(100), field: 'u_id_card_pic' },
        verifyPic: { type: DataTypes.STRING(100), field: 'u_verify_pic' }
    },
    {
        tableName: 'user'
    }
);

const Transaction = sequelize.define(
    'Transaction',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 't_id' },

        timestamp: { type: DataTypes.DATE, allowNull: false, field: 't_timestamp', defaultValue: () => sequelize.fn('NOW') },
        status: { type: DataTypes.INTEGER, allowNull: false, field: 't_status', defaultValue: 1 },

        evidencePic: { type: DataTypes.STRING(100), field: 't_evidence_pic' },

        address: { type: DataTypes.STRING(500), allowNull: false, field: 't_address' },
        tracking: { type: DataTypes.STRING, field: 't_tracking' }
    },
    {
        tableName: 'transaction'
    }
);

const TransactionItem = sequelize.define(
    'TransactionItem',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ti_id' },

        name: { type: DataTypes.STRING, allowNull: false, field: 'ti_name' },
        detail: { type: DataTypes.STRING(500), allowNull: false, field: 'ti_detail' },
        price: { type: DataTypes.FLOAT, allowNull: false, field: 'ti_price' },

        quantity: { type: DataTypes.INTEGER, allowNull: false, field: 'ti_quantity' },
    },
    {
        tableName: 'transaction_item'
    }
);

const Matching = sequelize.define(
    'Matching',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'ti_id' },

        name: { type: DataTypes.STRING, allowNull: false, field: 'ti_name' },
        detail: { type: DataTypes.STRING(500), allowNull: false, field: 'ti_detail' },
        price: { type: DataTypes.FLOAT, allowNull: false, field: 'ti_price' },

        quantity: { type: DataTypes.INTEGER, allowNull: false, field: 'ti_quantity' },
    },
    {
        tableName: 'matching'
    }
);

Transaction.hasMany(
    TransactionItem,
    {
        foreignKey: { name: 'transaction', field: 't_id' },
    }
);

User.hasMany(
    Transaction,
    {
        foreignKey: { name: 'buyer', allowNull: false, field: 'u_buyer_id' },
    }
);

User.hasMany(
    Transaction,
    {
        foreignKey: { name: 'seller', allowNull: false, field: 'u_seller_id' },
    }
);

Event.hasMany(
    Transaction,
    {
        foreignKey: { name: 'event', allowNull: false, field: 'e_id' },
    }
);

User.hasMany(
    UserAddress,
    {
        foreignKey: { name: 'user', allowNull: false, field: 'u_id' },
    }
);

User.belongsTo(
    UserAddress,
    {
        foreignKey: { name: 'preferredAdress', field: 'ua_id' },
        constraints: false
    }
);

UserRole.hasMany(
    User,
    {
        foreignKey: { name: 'role', allowNull: false, defaultValue: 3, field: 'ur_id' },
    }
);

UserVendorStatus.hasMany(
    User,
    {
        foreignKey: { name: 'vendorStatus', allowNull: false, defaultValue: 1, field: 'uvs_id' },
    }
);

setTimeout(
    async () => {
        await sequelize.sync();
        if (await UserRole.count({ attributes: ['id'] }) === 0)
            await UserRole.bulkCreate(
                [
                    { detail: 'Admin' },
                    { detail: 'Supporter' },
                    { detail: 'Buyer' },
                    { detail: 'Seller' },
                ]
            );
        if (await UserVendorStatus.count({ attributes: ['id'] }) === 0)
            await UserVendorStatus.bulkCreate(
                [
                    { name: 'not request', detail: 'not request' },
                    { name: 'request pending', detail: 'Your request is pending for our Supporter to inspect.' },
                    { name: 'request granted', detail: 'Your request has been granted. You are seller now.' },
                    { name: 'request rejected', detail: 'Your request has been rejected. Please review your information again.' }
                ]
            );
    },
    2000
);

module.exports = {
    Event,
    User,
    UserRole,
    UserAddress,
    UserVendorStatus,
    Transaction,
    TransactionItem,
    Matching
};
