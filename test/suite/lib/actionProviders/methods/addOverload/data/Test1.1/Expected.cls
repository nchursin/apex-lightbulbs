public class Test {
    public void methodToOverload(Integer someInt) {
        methodToOverload('cba', someInt);
    }

    public void methodToOverload(String abc, Integer someInt) {
        abc += '123';
    }
}
