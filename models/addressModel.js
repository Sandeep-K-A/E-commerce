const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    address: [{
        FullName: {
            type: String,

        },
        HouseAddress: {
            type: String,

        },
        City: {
            type: String,

        },
        State: {

        },
        PostalCode: {
            type: String,

        },
        Phone: {
            type: Number,

        },
        Email: {
            type: String,

        }
    }]

})

const userAddress = mongoose.model("userAddress", addressSchema);
module.exports = userAddress;