module.exports.generateAppMock = () => {
    return {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        head: jest.fn()
    }
};

module.exports.generateResponseMock = () => {
    const resMock = {
        end: jest.fn()
    };
    resMock.status = jest.fn().mockReturnValue(resMock);
    resMock.set = jest.fn().mockReturnValue(resMock);
    resMock.json = jest.fn().mockReturnValue(resMock);
    resMock.send = jest.fn().mockReturnValue(resMock);
    return resMock;
};

module.exports.generateRequestMock = () => {
    const reqMock = {
        params: {},
        query: {},
        body: ''
    };
    return reqMock;
};