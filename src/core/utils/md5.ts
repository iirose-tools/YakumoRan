import crypto from 'crypto';

export default (str: string) => crypto.createHash('md5').update(str).digest('hex');