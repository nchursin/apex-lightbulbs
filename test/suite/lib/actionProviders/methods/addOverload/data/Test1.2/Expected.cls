public class Test {
    public class InnerClass {
        public void methodToOverload(Integer someInt) {
            methodToOverload('cba', someInt);
        }

        public void methodToOverload(String abc, Integer someInt) {
            abc += '123';
        }
    }
}
