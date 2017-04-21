var ls = require('local-storage');

var index = function(req, res) {
	var login = ls.get('login');
	var id 		= ls.get('id');

	db.serialize(function() {
		return db.all("SELECT * FROM category", function(err, rows) {
			return db.all("SELECT * FROM tov", function(err2, rows2) {
				var lg = rows.length;
				var tovar = [];
				var ind = 0;

				var id_cat = [];
				for (var i = 0; i < rows.length; i++)
				{
					id_cat.push(rows[i].id);
					tovar[i] = [];
				}

				for (var i = 0; i < rows2.length; i++)
				{
					ind = id_cat.indexOf(rows2[i].category);
					tovar[ind].push(rows2[i]);
				}

				res.render('index', {
					login: login,
					id: id,
					rows: rows,
					rows2: rows2,
					tovar: tovar
				});
			})
		});
	});

}

var basket = function(req, res) {
	var login = ls('login');
	var id_user = ls('id');

	// var login = 'dex1cre';
	// var id_user = 1;

	if (login)
		db.serialize(function() {
			return db.all("SELECT * FROM orders WHERE id_user=$id AND status=0", {
				$id: id_user
			}, function(err, rows) {
				if (err)
					console.log(err);

				var mass = [];
				var mass2 = [];
				var flag = false;
				var index = 0;

				for (var i=0; i < rows.length; i++) {
					for (var j=0; j < mass2.length; j++) {
						if (mass2[j] == rows[i].id_tov) {
							flag = true;
							index = j;
							break;
						}
					}

					if (flag) {
						var count = rows[i].count;
						mass[index].count += count;
					} else {
						mass.push(rows[i]);
						mass2.push(rows[i].id_tov);
					}
				}

				return db.all("SELECT * FROM tov", function(err2, rows2) {
					if (err2)
						console.log(err2);

					return res.render("basket", {
						tov: rows2,
						order: mass,
						login: login
					});
				})
			});
		});
	else
		res.send('Вы не вошли в систему!<br><a href="/enter">Вход</a><br><a href="/">Назад</a>');
	// res.render("basket", {
	// 	login: login
	// });
}

var enter = function(req, res) {
	res.render('enter');
}

var registration = function(req, res) {
	res.render('registration')
}

var registration_site = function(req, res) {
	if (req.body.login    != "" &&
			req.body.password != "" &&
			req.body.vk_link  != "")
			db.serialize(function() {
				db.all("SELECT * FROM users WHERE login=$login", {
					$login: req.body.login
				}, function(err, rows) {
					if (rows[0])
						res.send('Этот никнейм занят, придумайте другой <br><a href="/registration">Назад</a>');
					else
						return db.run("INSERT INTO users(login, password, vk_link) VALUES($login, $password, $vk_link)", {
								$login: req.body.login,
								$password: req.body.password,
								$vk_link: req.body.vk_link
							}, function(err) {
								if (err)
									console.log(err);
								return res.redirect('/');
							});
				});
			});
	else
		res.send('Вы заполнили не все поля <br><a href="/registration">Назад</a>')
}

var enter_site = function(req, res) {
	if (req.body.login 		!= "" &&
			req.body.password != "")
			db.serialize(function() {
				return db.all("SELECT * FROM users WHERE login=$login AND password=$password", {
					$login: req.body.login,
					$password: req.body.password
				}, function(err, row){
					if (err)
						console.log(err);
					if (row[0]) {
						ls.set("id", row[0].id);
						ls.set("login", row[0].login);
						res.redirect('/');
					} else
						res.send('Логин или пароль введён неверно <br><a href="/enter">Назад</a>')
				});
			});
	else
		res.send('Вы заполнили не все поля <br><a href="/enter">Назад</a>')
}

var to_basket = function(req, res) {
	if (req.body.id != "" &&
			req.body.count != "")
			db.serialize(function() {
				return db.run("INSERT INTO orders(id_user, id_tov, count) VALUES($id_user, $id_tov, $count)", {
					$id_user: ls('id'),
					$id_tov: req.body.id,
					$count: req.body.count
				}, function(err) {
					if (err)
						console.log(err);
					res.json({data: "Okay"})
				})
			});
	else
		res.json({data: "not Okay"});
}

var to_basket_see = function(req, res) {
	var login = ls('login');
	var id_user = ls('id');

	if (login) {
		db.serialize(function() {
			return db.run("UPDATE orders SET status=1 WHERE id_user=$id", {
				$id: id_user
			}, function(err) {
				if (err)
					console.log(err);

				return res.redirect("/basket");
			});
		});
	} else
		return res.end("Что-то ты не туда забрёл!");
}

var exit = function(req, res) {
	var login = ls('login');
	var id_user = ls('id');

	if (login) {
		ls.remove('login');
		return res.redirect('/');
	}
	else
		return res.end("Ти что тут забыл?!!");
}

var ninh = function(req, res) {
	db.serialize(function() {
		return db.all("SELECT * FROM category", function(err, rows) {
			if (err)
				console.log(err);
			return res.render("nikita_idi_na_her", {
				category: rows,
			});
		});
	});
}

var ninh_zak = function(req, res) {
	db.serialize(function() {
		return db.all("SELECT * FROM users", function(err, rows) {
			if (err)
				console.log(err);
			return res.render('ninh-zak', {
				users: rows
			});
		});
	});
}

var ninh_zak_name = function(req, res) {
	var id_user = req.query.id;
	db.serialize(function() {
		return db.all('SELECT * FROM orders WHERE id_user=$id AND status=1', {
			$id: id_user
		}, function(err, rows) {
			if (err)
				console.log(err);

				var mass = [];
				var mass2 = [];
				var flag = false;
				var index = 0;

				for (var i=0; i < rows.length; i++) {
					for (var j=0; j < mass2.length; j++) {
						if (mass2[j] == rows[i].id_tov) {
							flag = true;
							index = j;
							break;
						}
					}

					if (flag) {
						var count = rows[i].count;
						mass[index].count += count;
					} else {
						mass.push(rows[i]);
						mass2.push(rows[i].id_tov);
					}
				}

				return db.all("SELECT * FROM tov", function(err2, rows2) {
					if (err2)
						console.log(err2);
					return res.render("ninh-zak", {
						orders: mass,
						tovars: rows2,
					})
				})
		});
	});
}

var nh_tov = function(req, res) {
	db.serialize(function() {
		return db.all("SELECT * FROM tov", function(err, rows) {
			if (err)
				console.log(err);

			return res.render("nh-tov", {
				tovars: rows
			})
		});
	});
}

var ninh_new = function(req, res) {
	if (req.body.name != "" &&
			req.body.description != "" &&
			req.body.price != "" &&
			req.body.count != "" &&
			req.body.category != "" &&
			req.body.img != "")
			db.serialize(function() {
				return db.run("INSERT INTO tov(name, description, price, count, category, img) VALUES($name, $description, $price, $count, $category, $img)", {
					$name: req.body.name,
					$description: req.body.description,
					$price: req.body.price,
					$count: req.body.count,
					$category: req.body.category,
					$img: req.body.img
				}, function(err) {
					if (err)
						console.log(err);
					return res.redirect("/ninh");
				});
			});
	else
		return res.end("Не все поля заполнены");
}

var find_tov = function(req, res) {
	db.serialize(function() {
		return db.all("SELECT * FROM tov WHERE id=$id", {
			$id: req.body.id
		}, function(err, rows) {
			if (err)
				console.log(err);
			if (rows[0] && rows[0].id != "")
				return res.send(`
					<html>
					<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css", rel="stylesheet", integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u", crossorigin="anonymous">
					<body>
					<div class="container">
						` + rows[0].name + `<br>
						<form method="post" action="/find-delete-tov">
							<input type="text" name="id" value="` + rows[0].id + `">
							<button class="btn btn-danger">Удалить</button>
						</form>
					</div>
					</body>
					</html>
					`);
			else
				return res.end("Ничего не найдено!");
		});
	});
}

var find_delete_tov = function(req, res) {
	db.serialize(function() {
		return db.run("DELETE FROM tov WHERE id=$id", {
			$id: req.body.id
		}, function(err) {
			if (err)
				console.log(err);
			return res.redirect("/ninh");
		});
	});
}

data = {
	"/": index,
	'/to-basket': to_basket,
	'/basket': basket,
	'/enter': enter,
	'/registration': registration,
	'/registration-site': registration_site,
	'/enter-site': enter_site,
	'/to-basket-see': to_basket_see,
	'/exit': exit,
	'/ninh': ninh,
	'/ninh-zak': ninh_zak,
	'/ninh-new': ninh_new,
	'/ninh_zak/name': ninh_zak_name,
	'/nh-tov': nh_tov,
	'/find-tov': find_tov,
	'/find-delete-tov': find_delete_tov,
}

exports.data = data;
