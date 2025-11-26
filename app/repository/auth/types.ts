export interface User {
    uuid:          string;
    username:      null;
    own_ref_code:  null;
    email:         string;
    balance:       string;
    demo_balance:  string;
    bonus_balance: string;
    tokens:        number;
    withdrawals:   any[];
    payments:      any[];
    in_demo_mode:boolean
    is_streamer:boolean

}