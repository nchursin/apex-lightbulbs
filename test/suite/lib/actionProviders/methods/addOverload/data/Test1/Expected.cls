public class Test {
    public String methodToOverload(Integer someInt) {
        return methodToOverload('cba', someInt);
    }

    public String methodToOverload(String abc, Integer someInt) {
        return abc;
    }
}
