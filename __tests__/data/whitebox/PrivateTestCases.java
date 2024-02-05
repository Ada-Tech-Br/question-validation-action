import static org.junit.Assert.assertEquals;
import org.junit.Test;


public class PrivateTestCases {
    
    @Test
    public void testeContaSemChequeEspecialNovoLimiteZero()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", false);
        cc.modificarLimiteChequeEspecial(1000);
        assertEquals(0, cc.limiteDoChequeEspecial, 0);
    }

    @Test
    public void testeContaComChequeEspecialNovoLimiteMaiorZero()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", true);
        cc.modificarLimiteChequeEspecial(1000);
        assertEquals(1000, cc.limiteDoChequeEspecial, 0);
    }

    @Test
    public void testeContaComChequeEspecialReduzirLimite()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", true);
        cc.modificarLimiteChequeEspecial(100);
        assertEquals(100, cc.limiteDoChequeEspecial, 0);
    }

    @Test
    public void testeContaComChequeEspecialZerarLimite()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", true);
        cc.modificarLimiteChequeEspecial(0);
        assertEquals(0, cc.limiteDoChequeEspecial, 0);
    }

    @Test
    public void testeContaComChequeEspecialAlterarLimiteMenorZero()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", true);
        cc.modificarLimiteChequeEspecial(-1);
        assertEquals(500, cc.limiteDoChequeEspecial, 0);
    }
}