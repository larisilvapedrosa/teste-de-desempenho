
import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate==1.00'],
    },
};

export default function () {
    const response = http.get('http://localhost:3000/health');
    
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
        'response has status field': (r) => {
            if (r.status === 200 && r.body) {
                try {
                    const body = JSON.parse(r.body);
                    return body.status === 'UP';
                } catch (e) {
                    return false;
                }
            }
            return false;
        },
    });
}

