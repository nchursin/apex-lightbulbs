public class Test {
    public String stringVar;
    public String stringVarWithSpaces; 

    public Test(String stringVar) {
        this.stringVar = stringVar;

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
