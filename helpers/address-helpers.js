const addressModel = require('../models/addressModel')

module.exports = {

    addAddress: (id, body) => {

        return new Promise(async (resolve, reject) => {

            const addressExist = await addressModel.findOne({ userId: id })

            if (!addressExist) {
                new addressModel({
                    userId: id,
                    address: [{
                        FullName: body.fullname,
                        HouseAddress: body.houseaddress,
                        City: body.city,
                        State: body.state,
                        PostalCode: body.zipCode,
                        Phone: body.phone,
                        Email: body.email
                    }]
                }).save().then((newAddress) => {
                    resolve()
                }).catch((error) => {
                    reject(error)
                })
            } else {
                const sameAddress = await addressModel.findOne({ userId: id, address: { $elemMatch: { FullName: body.fullname, HouseAddress: body.houseaddress } } })
                console.log(sameAddress, "?L?LL?L?L?L?L?L?L?L?L")

                if (sameAddress) {
                    const err = "The Address already exist.!!";
                    reject(err);
                } else {
                    const userAddress = await addressModel.findOne({ userId: id })
                    userAddress.address.push({
                        FullName: body.fullname,
                        HouseAddress: body.houseaddress,
                        City: body.city,
                        State: body.state,
                        PostalCode: body.zipCode,
                        Phone: body.phone,
                        Email: body.email
                    })
                    userAddress.save()
                    resolve()
                }
            }
        })
    },
    fetchAllAddress: (id) => {
        return new Promise((resolve, reject) => {
            addressModel.findOne({ userId: id }).then((addresses) => {
                console.log(addresses)
                resolve(addresses)
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    updateAddress: (id, body) => {
        console.log(body);
        return new Promise(async (resolve, reject) => {
            try {
                await addressModel.updateOne(
                    { userId: id, 'address._id': body.addressId },
                    {
                        $set: {
                            'address.$.FullName': body.FullName,
                            'address.$.HouseAddress': body.HouseAddress,
                            'address.$.City': body.City,
                            'address.$.State': body.State,
                            'address.$.PostalCode': body.PostalCode,
                            'address.$.Phone': body.Phone,
                            'address.$.Email': body.Email,
                        },
                    }
                );
                const address = await addressModel.findOne({ userId: id, address: { $elemMatch: { _id: body.addressId } } }, { 'address.$': 1 });
                let updatedAddress = address.address[0];
                resolve(updatedAddress);
            } catch (error) {
                reject(error);
            }
        });
    }

}