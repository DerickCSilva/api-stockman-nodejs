class Validation {
    async existsOrError(value, msg) {
        if(!value) throw msg
    }

    async equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }
}
module.exports = new Validation();