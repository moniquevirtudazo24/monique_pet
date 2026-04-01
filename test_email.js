const https = require('https');

const data = JSON.stringify({
    service_id: 'service_gx4gg02',
    template_id: 'template_6vw1msj',
    user_id: 'dC0SBBITAjZJoz3ns',
    template_params: {
        to_email: 'test@example.com',
        to_name: 'Test',
        pet_name: 'Test Pet',
        service: 'Test Service',
        date_time: 'Now',
        status: 'Test Status',
        message: 'Test Message',
        admin_notes: 'None'
    }
});

const options = {
    hostname: 'api.emailjs.com',
    path: '/api/v1.0/email/send',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let result = '';
    res.on('data', (chunk) => result += chunk);
    res.on('end', () => console.log('HTTP ' + res.statusCode + ':', result));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
