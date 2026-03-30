"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabaseServiceClient = exports.supabaseClient = exports.supabaseAnonKey = exports.supabaseUrl = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
exports.supabaseUrl = process.env.SUPABASE_URL;
exports.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
exports.supabaseClient = (0, supabase_js_1.createClient)(exports.supabaseUrl, exports.supabaseAnonKey);
exports.supabaseServiceClient = (0, supabase_js_1.createClient)(exports.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
exports.supabaseAdmin = (0, supabase_js_1.createClient)(exports.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
