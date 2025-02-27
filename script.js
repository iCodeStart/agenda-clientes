// Pegando os elementos do DOM

const form = document.getElementById("contact-form");
const contactList = document.getElementById("contact-list");
const exportBtn = document.getElementById("export-btn");
const searchInput = document.getElementById("search");
const editIndexInput = document.getElementById("edit-index");
const saveBtn = document.getElementById("save-btn");
const phoneInput = document.getElementById("phone");

// Recuperar contatos do LocalStorage ou inicializar um array vazio

let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

// Salvar contatos no LocalStorage

function saveContacts() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Renderizar a Lista de Contatos na Tabela

function renderContacts(filter = "") {
  contactList.innerHTML = "";

  contacts.forEach((contact, index) => {
    if (
      contact.name.toLowerCase().includes(filter.toLocaleLowerCase()) ||
      contact.phone.includes(filter) ||
      contact.email.toLowerCase().includes(filter.toLowerCase())
    ) {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.phone}</td>
            <td>${contact.email}</td>
            <td>
                <button class="action-buttons edit-btn" onclick="editContact(${index})">Editar</button>
                <button class="action-buttons delete-btn" onclick="deleteContact(${index})">Deletar</button>
            </td>
        `;
        contactList.appendChild(row);
    }
  });
}


// Aplicar máscara no input de telefone

document.addEventListener("DOMContentLoaded", function(){

    if(phoneInput){
        phoneInput.addEventListener("input", function(e) {
            const target = e.target;
            let value = target.value.replace(/\D/g, '');

            if(value.length > 0){
                if(value.length <= 2){
                    value = `(${value}`;
                } else if(value.length <= 7){
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                } else {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7,11)}`;
                }
            }

            target.value = value;
        })
    }
})


// Validar número de telefone usando a API do numVerify

async function validatePhoneNumber(phone){
    const apiKey = "5b58b272e5e0a1b8793171a3c39f8894";
    const formattedPhone = phone.replace(/\D/g, '');

    try {
        const response = await fetch(`https://apilayer.net/api/validate?access_key=${apiKey}&number=55${formattedPhone}`)

        const data = await response.json();

        if(!data.valid){
            alert("Número de telefone inválido! Verifique e tente novamente");
            return false;
        }
        return true;
    } catch(error){
        console.error(error);
        alert("Erro ao validar telefone, pois o serviço não está funcionando corretamente");
        return false;
    }
}

//Adicionar contato ou editar um contato existente

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = phoneInput.value;
    const email = document.getElementById("email").value;
    const editIndex = editIndexInput.value;

    const isValidPhone = await validatePhoneNumber(phone);

    if(!isValidPhone) return;

    if(editIndex === ""){
        contacts.push({ name, phone, email});
    } else {
        contacts[editIndex] = { name, phone, email };
        editIndexInput.value = "";
        saveBtn.textContent = "Adicionar Cliente";
    }

    saveContacts();
    renderContacts();
    form.reset();
})

function editContact(index){
    const contact = contacts[index];
    document.getElementById("name").value = contact.name;
    document.getElementById("phone").value = contact.phone;
    document.getElementById("email").value = contact.email;
    editIndexInput.value = index;
    saveBtn.textContent = "Salvar Edição";
}

function deleteContact(index){
    contacts.splice(index, 1);
    saveContacts();
    searchInput.value = "";
    renderContacts();
}

function exportToExcel(){
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");

    XLSX.utils.sheet_add_aoa(worksheet, [["Nome", "Telefone", "Email"]], { origin: "A1" });

    XLSX.writeFile(workbook, "agenda_contatos.xlsx");
}

exportBtn.addEventListener("click", exportToExcel);

// Filtrar valores no input de busca

searchInput.addEventListener("input", function(){
    renderContacts(searchInput.value);
})

renderContacts();