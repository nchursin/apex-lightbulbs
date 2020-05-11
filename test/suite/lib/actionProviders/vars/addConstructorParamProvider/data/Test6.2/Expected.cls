public class Test {
    public String stringVar;
    public Integer integerVar;

    public Test(String stringVar) {
        this.stringVar = stringVar;
    }           

    public Test(Integer integerVar) {
        this.integerVar = integerVar;
    }           

    public class InnerClass {
        public String innerClassVar;
        public String innerClassVar2;

        public InnerClass(
            String innerClassVar
        ) {
            this.innerClassVar = innerClassVar;
        }
    }
}
