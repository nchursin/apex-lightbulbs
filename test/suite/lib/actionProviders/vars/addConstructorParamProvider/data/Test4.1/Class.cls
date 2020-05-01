public class Test {
    public String stringVar;
    public String stringVarWithSpaces; 

    public Test() {

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
