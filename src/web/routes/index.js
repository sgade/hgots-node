/*
 * Routes
 * */

/* Default route */
exports.index = function(req, res) {
  res.render('index', {
    title: 'hgots-node'
  });
};
