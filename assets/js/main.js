//Variables_
const selectm = document.getElementById('moneyconv');
const clpinit = document.getElementById('clpinit');
const result = document.getElementById('convert');
const botonconvert = document.getElementById('buttonconv');
const graph = document.getElementById('myChart');
let chart;
const urlApi = 'https://mindicador.cl/api';
let data; 


//Data_
const getData = async () => {
    try {
        const res = await fetch(urlApi);
        const jsonData = await res.json();
        data = jsonData; 
        return jsonData;
    } catch (error) {
        alert('No ha sido posible entregar los resultados');
    }
}


//Functions_
async function showMoney() {
    try {
        const data = await getData();
        Object.keys(data).forEach((monedaKey) => {
            const moneda = data[monedaKey];
            if (moneda.codigo && moneda.valor) {
                const option = document.createElement('option');
                option.value = moneda.codigo;
                option.textContent = moneda.codigo;
                selectm.appendChild(option);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function convertMoney() {
    const monedaSelect = selectm.value;
    const valorClpInit = parseFloat(clpinit.value);
    graph.innerHTML = '';
    if (!isNaN(valorClpInit) && monedaSelect !== 'CLP' && valorClpInit >= 0) {
        const convertResult = valorClpInit / data[monedaSelect].valor;
        result.textContent = `$${convertResult.toFixed(2)}`;
        let fechas = await getDates(monedaSelect);
        let valores = await getValues(monedaSelect);
        graphs(fechas, valores);
    } else {
        alert('Necesitamos que agregues un valor y moneda válida para poder convertir');
    }
}

function resetDates(fecha) {
    const fechaObj = new Date(fecha);
    const day = fechaObj.getDate();
    const month = fechaObj.getMonth() + 1;
    const year = fechaObj.getFullYear();
    return `${day}-${month < 10 ? '0' : ''}${month}-${year}`;
}


async function getDates(moneda) {
    try {
        const res = await fetch(`${urlApi}/${moneda}`);
        const data = await res.json();
        const fechas = data.serie.map(entry => entry.fecha).slice(0, 10);
        return fechas;
    } catch (error) {
        console.error(error);
    }
}

async function getValues(moneda) {
    try {
        const res = await fetch(`${urlApi}/${moneda}`);
        const data = await res.json();
        const valores = data.serie.map(entry => entry.valor).slice(0, 10);
        return valores;
    } catch (error) {
        console.error(error);
    }
}

//Graphs
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    if (isNaN(date)) {
        return dateString;
    }
    return date.toLocaleDateString(undefined, options).replace(/\//g, '-');
}

function graphs(date, value) {
    const reversedDates = date.map(fecha => formatDate(fecha)).reverse();
    const info = value;
    const dateset1 = {
        label: "Conversión en los últimos 10 días",
        data: value,
        borderColor: '#072e33',
        fill: false,
        tension: 0.1
    };

    const data = {
        labels: reversedDates,
        datasets: [dateset1]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                x: {
                    ticks: {
                        callback: function(value, index, values) {
                            return reversedDates[index]; 
                        }
                    }
                }
            }
        }
    };

    if (chart) chart.destroy();
    chart = new Chart(graph, config);
}


//FunctionCall_
window.addEventListener('load', showMoney);
botonconvert.addEventListener('click', convertMoney);
