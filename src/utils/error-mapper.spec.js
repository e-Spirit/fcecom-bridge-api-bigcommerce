const { mapErrors } = require('./error-mapper');
const { BodyValidationError } = require('fcecom-bridge-commons');
describe('error-mapper', () => {
    describe('mapError()', () => {
        it('throws when POST and response contains errors', () => {
            const testPostResponse = { config: { method: 'post' }, data: {} };
            expect(() => mapErrors(testPostResponse)).toThrow(BodyValidationError);
        });
        it('throws when PUT response contains errors', () => {
            const testPostResponse = { config: { method: 'put' }, data: {} };
            expect(() => mapErrors(testPostResponse)).toThrow(BodyValidationError);
        });
        it('does NOT throw when GET', () => {
            const testPostResponse = { config: { method: 'get' }, data: {} };
            expect(() => mapErrors(testPostResponse)).not.toThrow(BodyValidationError);
        });
        it('does NOT throw when HEAD', () => {
            const testPostResponse = { config: { method: 'head' }, data: {} };
            expect(() => mapErrors(testPostResponse)).not.toThrow(BodyValidationError);
        });
        it('does NOT throw when no big commerce errors are available', () => {
            const testPostResponse = { config: { method: 'head' } };
            expect(() => mapErrors(testPostResponse)).not.toThrow(BodyValidationError);
        });
    });
});
