import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = {
  stages: [
    { duration: '5m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: '10m', target: 100 }, // stay at 100 users for 10 minutes
    { duration: '5m', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'https://test-api.k6.io';
const USERNAME = 'TestUser';
const PASSWORD = 'SuperCroc2020';

export default () => {
  const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(loginRes, {
    'logged in successfully': (resp) => resp.json('access') !== '',
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginRes.json('access')}`,
    },
  };

  const myObjects = http.get(`${BASE_URL}/my/crocodiles/`, authHeaders).json();
  check(myObjects, { 'retrieved crocodiles': (obj) => obj.length > 0 });

  sleep(1);
};

export function handleSummary(data) {
    return {
      "result-sample-load-test.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
  }
