let intervalId = null;

module.exports = {
    setIntervalId(id) {
        intervalId = id;
    },
    getIntervalId() {
        return intervalId;
    },
    clearIntervalId() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    },
};
