import * as api from '../../lib/api';

api.command(/^赞我$/, (m, e, reply) => {
  api.method.like(e.uid, `qwq`);
})