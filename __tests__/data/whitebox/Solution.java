class ContaBancaria {
    protected String agencia;
    protected String conta;
    protected double saldo;

    public ContaBancaria(String agencia, String conta) {
        this.agencia = agencia;
        this.conta = conta;
        this.saldo = 0.0;
    }

    public void depositar(double valor) {
        saldo += valor;
    }

    public boolean sacar(double valor) {
        if (valor <= saldo) {
            saldo -= valor;
            return true;
        } else {
            return false;
        }
    }

    public double getSaldo() {
        return saldo;
    }
}

class ContaCorrente extends ContaBancaria {
    boolean possuiChequeEspecial;
    double limiteDoChequeEspecial;

    public ContaCorrente(String agencia, String conta, boolean possuiChequeEspecial) {
        super(agencia, conta);
        this.possuiChequeEspecial = possuiChequeEspecial;
        this.limiteDoChequeEspecial = possuiChequeEspecial ? 500.0 : 0.0;
    }

    public void modificarLimiteChequeEspecial(double novoLimite) {
        if (possuiChequeEspecial && novoLimite >= 0) {
            limiteDoChequeEspecial = novoLimite;
        }
    }
}
