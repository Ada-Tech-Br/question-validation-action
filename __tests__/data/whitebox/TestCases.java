import static org.junit.Assert.assertEquals;
import org.junit.Test;


public class TestCases {
    
    @Test
    public void testeValidarContaNovaSemChequeEspecial()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", false);
        assertEquals("100", cc.agencia);
        assertEquals("1000", cc.conta);
        assertEquals(false, cc.possuiChequeEspecial);
        assertEquals(0, cc.limiteDoChequeEspecial, 0);
    }

    @Test
    public void testeValidarContaNovaComChequeEspecial()
    {
        ContaCorrente cc = new ContaCorrente("100", "1000", true);
        assertEquals("100", cc.agencia);
        assertEquals("1000", cc.conta);
        assertEquals(true, cc.possuiChequeEspecial);
        assertEquals(500, cc.limiteDoChequeEspecial,0);
    }
}
