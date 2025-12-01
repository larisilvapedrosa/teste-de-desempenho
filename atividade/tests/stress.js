
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '2m', target: 500 }, 
        { duration: '2m', target: 1000 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<10000'], 
        http_req_failed: ['rate<0.50'],
    },
};

export default function () {
    const payload = JSON.stringify({
        items: [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 1 }
        ],
        customerId: Math.floor(Math.random() * 1000),
        paymentMethod: 'crypto'
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
    };

    const response = http.post('http://localhost:3000/checkout/crypto', payload, params);
    
    check(response, {
        'status is 201': (r) => r.status === 201,
        'response has id': (r) => {
            if (r.status === 201) {
                const body = JSON.parse(r.body);
                return body.hasOwnProperty('id');
            }
            return false;
        },
        'response has status SECURE_TRANSACTION': (r) => {
            if (r.status === 201) {
                const body = JSON.parse(r.body);
                return body.status === 'SECURE_TRANSACTION';
            }
            return false;
        },
    });

    sleep(1);
}

