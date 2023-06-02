const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    walledId: {
        type: Number
    },
    walletAmount: {
        type: Number
    }

})

const userWallet = mongoose.model("userWallets", walletSchema);
module.exports = userWallet;
