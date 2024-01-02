import { GithubUser } from "./githubUser.js";

export class Favorites {
	constructor(divApp) {
		this.divApp = document.querySelector(divApp);
		this.load();
	}

	load() {
		this.entries = JSON.parse(localStorage.getItem("@gitFav:", [])) || [];
	}
	save() {
		localStorage.setItem("@gitFav:", JSON.stringify(this.entries));
	}

	async add(username) {
		try {
			const userExists = this.entries.find((entry) => entry.login == username);
			if (userExists) {
				throw new Error("Usuario já cadastrado");
			}
			const user = await GithubUser.search(username);

			if (user.login === undefined) {
				throw new Error("usuario não encontrado!");
			}

			this.entries = [user, ...this.entries];
			this.update();
			this.save();
		} catch (error) {
			alert(error.message);
		}
	}

	delete(user) {
		const filteredEntries = this.entries.filter(
			(item) => item.login !== user.login
		);

		this.entries = filteredEntries;
		this.update();
		this.save();
	}
}

export class FavoritesView extends Favorites {
	constructor(divApp) {
		super(divApp);

		this.tbody = this.divApp.querySelector("table tbody");

		this.update();
		this.onAdd();
	}

	createRowNoFavorites() {
		const tr = document.createElement("tr");
		tr.classList.add("rowNoFavorites");

		const data = `
    <td class="td-rowNoFavorites" colspan="4">
		  <div>
		    <img src="./assets/star.svg" alt="" />
				<h2>Nenhum favorito ainda</h2>
		  </div>
		</td>
    `;

		tr.innerHTML = data;
		/* this.tbody.append(tr); */
		return tr;
	}
	removeRowNoFavorites() {
		/* const rowNoFav = this.tbody.querySelector(".rowNoFavorites").remove();
		rowNoFav.remove();
		//o remove() ñ funciona */

		this.tbody.querySelectorAll("tr.rowNoFavorites").forEach((tr) => {
			tr.remove();
		});
	}

	createRow() {
		const tr = document.createElement("tr");
		tr.classList.add("rowFavorites");
		const data = `
    <td class="user">
      <img
        src="https://github.com/maykbrito.png"
        alt="imagem de maykbrito"
      />
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Maik Brito</p>
        <span>maykbrito</span>
      </a>
    </td>
    <td class="repositories">76</td>
    <td class="followers">9589</td>
    <td><button class="remove">remover</button></td>
  `;

		tr.innerHTML = data;

		return tr;
	}

	removeAllTr() {
		this.tbody.querySelectorAll("tr.rowFavorites").forEach((tr) => {
			tr.remove();
		});
	}

	update() {
		this.removeAllTr();

		if (this.entries.length == 0) {
			const rowNoFavorites = this.createRowNoFavorites();
			this.tbody.append(rowNoFavorites);
		} else {
			this.removeRowNoFavorites();
			this.entries.forEach((user) => {
				const row = this.createRow();

				row.querySelector(
					".user img"
				).src = `https://github.com/${user.login}.png`;
				row.querySelector(".user img").alt = `imagem de ${user.name}`;
				row.querySelector(".user p").textContent = user.name;
				row.querySelector(".user a").href = `https://github.com/${user.login}`;
				row.querySelector(".user span").textContent = `/ ${user.login}`;
				row.querySelector("td.repositories").textContent = user.public_repos;
				row.querySelector("td.followers").textContent = user.followers;

				row.querySelector(".remove").onclick = () => {
					const isOk = confirm("Tem certeza que deseja remover esse usuario?");
					if (isOk) {
						this.delete(user);
					}
				};
				this.tbody.append(row);
			});
		}
	}

	onAdd() {
		const addButton = this.divApp.querySelector(".search button");
		addButton.onclick = () => {
			const { value } = this.divApp.querySelector("#input-search");
			this.add(value);
		};
	}
}
