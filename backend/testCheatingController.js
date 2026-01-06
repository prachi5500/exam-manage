import * as controller from './cheatingDetection.controller.mocked.js';

const makeReq = (body = {}, params = {}) => ({ body, params });

const makeRes = () => {
    return {
        status(code) { this._status = code; return this; },
        json(payload) { console.log('RESPONSE:', JSON.stringify({ status: this._status || 200, payload }, null, 2)); }
    };
};

const run = async () => {
    console.log('Calling detectCheating...');
    await controller.detectCheating(makeReq({ examAttemptId: 'attempt1', userId: 'user1' }), makeRes());

    console.log('\nCalling reportCheatActivity...');
    await controller.reportCheatActivity(makeReq({ examAttemptId: 'attempt1', activityType: 'tab-switch', severity: 'warning' }), makeRes());

    console.log('\nCalling getCheatingReport...');
    await controller.getCheatingReport(makeReq({}, { examAttemptId: 'attempt1' }), makeRes());

    console.log('\nCalling getAllCheatingReports...');
    await controller.getAllCheatingReports(makeReq(), makeRes());
};

run().catch(err => { console.error('Test runner error:', err); process.exit(1); });
