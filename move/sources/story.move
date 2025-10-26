module chainmuse::story {
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use std::option::{Self, Option};

    /// Represents a single node in a branching story. It's an ownable object.
    /// Each StoryNode contains an IPFS CID pointing to the actual story content.
    struct StoryNode has key, store {
        id: UID,
        /// The Object ID of the parent StoryNode, if it's not a root node.
        parent: Option<ID>,
        /// The IPFS CID for the story's content (stored on IPFS network).
        ipfs_cid: String,
        /// The title of the story node.
        title: String,
        /// The address of the user who created this node.
        creator: address,
        /// Timestamp when the node was created.
        created_at: u64,
    }

    /// Emitted when a new StoryNode is created.
    /// The frontend can listen for this event to update the UI in real-time.
    struct StoryNodeCreated has copy, drop {
        object_id: ID,
        parent_id: Option<ID>,
        ipfs_cid: String,
        title: String,
        creator: address,
        created_at: u64,
    }

    /// Creates a new root StoryNode (NFT) with no parent.
    /// This is the starting point of a new story branch.
    public entry fun create_root_story(
        title: vector<u8>,
        ipfs_cid: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let title_string = string::utf8(title);
        let cid_string = string::utf8(ipfs_cid);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        let story_node = StoryNode {
            id: object::new(ctx),
            parent: option::none(),
            ipfs_cid: cid_string,
            title: title_string,
            creator: sender,
            created_at: timestamp,
        };

        // Emit an event with the details of the newly created node.
        event::emit(StoryNodeCreated {
            object_id: object::id(&story_node),
            parent_id: story_node.parent,
            ipfs_cid: story_node.ipfs_cid,
            title: story_node.title,
            creator: story_node.creator,
            created_at: story_node.created_at,
        });

        // Transfer the newly created StoryNode object to the transaction sender.
        transfer::public_transfer(story_node, sender);
    }

    /// Creates a new child StoryNode (NFT) branching from an existing parent.
    /// This creates a new story branch from an existing node.
    public entry fun create_child_story(
        title: vector<u8>,
        ipfs_cid: vector<u8>,
        parent_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let title_string = string::utf8(title);
        let cid_string = string::utf8(ipfs_cid);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        let story_node = StoryNode {
            id: object::new(ctx),
            parent: option::some(parent_id),
            ipfs_cid: cid_string,
            title: title_string,
            creator: sender,
            created_at: timestamp,
        };

        // Emit an event with the details of the newly created node.
        event::emit(StoryNodeCreated {
            object_id: object::id(&story_node),
            parent_id: story_node.parent,
            ipfs_cid: story_node.ipfs_cid,
            title: story_node.title,
            creator: story_node.creator,
            created_at: story_node.created_at,
        });

        // Transfer the newly created StoryNode object to the transaction sender.
        transfer::public_transfer(story_node, sender);
    }

    /// Returns the IPFS CID of a StoryNode.
    /// This allows the frontend to fetch the actual content from IPFS.
    public fun get_ipfs_cid(story_node: &StoryNode): String {
        story_node.ipfs_cid
    }

    /// Returns the parent ID of a StoryNode, if it exists.
    public fun get_parent_id(story_node: &StoryNode): Option<ID> {
        story_node.parent
    }

    /// Returns the creator address of a StoryNode.
    public fun get_creator(story_node: &StoryNode): address {
        story_node.creator
    }

    /// Returns the creation timestamp of a StoryNode.
    public fun get_created_at(story_node: &StoryNode): u64 {
        story_node.created_at
    }
}