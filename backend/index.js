require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');


const app = express();
const port = process.env.PORT || 4000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'Ok', message: 'Backend is running!' });
});

// Thêm các API khác ở đây nếu cần...

app.listen(port, () => {
    console.log(`Backend đang chạy tại: http://localhost:${port}`);
});