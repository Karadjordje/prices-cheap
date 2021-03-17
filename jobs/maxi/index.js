const bossbat = require('../../lib/bossbat');
const populateCategories = require('./categories');
const populateProducts = require('./products');

bossbat.hire('populate-maxi', {
    cron: '0 6 * * *',
    work: async () => {
        await populateCategories();
        await populateProducts();
    },
});
