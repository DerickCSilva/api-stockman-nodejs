module.exports = (money) => {
    let v = parseFloat(money);

    v = v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    return v;
}