import fb from '@/firebase';

export const roomService = {
    get, createPrivateChat
};

async function get(currentUser, targetUser) {
    return fb.firestore.collection("rooms")
            .where("isPrivate", "==", true)
            .where("users", "array-contains", currentUser)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    return {success: false, error: "No user(s)"};
                }  
                
                var roomId;
                var success = false;
                for(var i = 0; i < snapshot.docs.length; i++) {
                    // Workaround as multiple array-contains filter is not allowed
                    if(snapshot.docs[i].data().users.indexOf(targetUser) >= 0) {
                        roomId = snapshot.docs[i].id;
                        success = true;
                        break;
                    }
                }

                return {success: success, roomID: roomId};
            }).catch(handleError);
}

async function createPrivateChat(currentUser, targetUser) {
    var data = {
        isPrivate: true,
        users: [currentUser, targetUser]
    };

    return fb.firestore.collection("rooms").add(data)
            .then(function(doc) {
                return {success: true, roomID: doc.id};
            }).catch(handleError);
}

function handleError(error) {
    console.log("Ops! " + error);
    return Promise.reject(error);
}
