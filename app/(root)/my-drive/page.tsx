import { getFiles } from "@/lib/actions/file.actions";
import MyDrive from "@/components/MyDrive";

const ParentComponent = async () => {
    const files = await getFiles({ types: [], searchText: "", sort: "" });

    return (<MyDrive files={files} />);
};

export default ParentComponent;