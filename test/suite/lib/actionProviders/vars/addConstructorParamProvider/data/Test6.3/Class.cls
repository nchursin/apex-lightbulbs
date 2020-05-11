public class Test {
    public String stringVar;
    public Integer integerVar;

    public Test(String stringVar) {
        this.stringVar = stringVar;
    }           

    public Test() {
    }           

    public class InnerClass {
        public String innerClassVar;
        public Integer innerIntegerVar;

        public InnerClass(
            String innerClassVar
        ) {
            this.innerClassVar = innerClassVar;
        }

        public InnerClass() {
        }
    }
}
