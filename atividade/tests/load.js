
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    const payload = JSON.stringify({
        items: [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 1 }
        ],
        customerId: Math.floor(Math.random() * 1000)
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const response = http.post('http://localhost:3000/checkout/simple', payload, params);
    
    check(response, {
        'status is 201': (r) => r.status === 201,
        'response has id': (r) => {
            const body = JSON.parse(r.body);
            return body.hasOwnProperty('id');
        },
        'response has status APPROVED': (r) => {
            const body = JSON.parse(r.body);
            return body.status === 'APPROVED';
        },
    });

    sleep(1);
}

